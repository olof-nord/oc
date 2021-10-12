import fs from 'fs-extra';
import path from 'path';
import request from 'minimal-request';
import _ from 'lodash';

import put from '../../utils/put';
import settings from '../../resources/settings';
import * as urlBuilder from '../../registry/domain/url-builder';
import * as urlParser from '../domain/url-parser';
import { RegistryCli } from '../../types';

const getOcVersion = (): string => {
  const ocPackagePath = path.join(__dirname, '../../../package.json'),
    ocInfo = fs.readJsonSync(ocPackagePath);

  return ocInfo.version;
};

interface RegistryOptions {
  registry?: string;
}

export default function registry(opts: RegistryOptions = {}): RegistryCli {
  let requestsHeaders = {
    'user-agent': `oc-cli-${getOcVersion()}/${process.version}-${
      process.platform
    }-${process.arch}`
  };

  return {
    add(registry: string, callback: Callback<null, string>) {
      if (registry.slice(registry.length - 1) !== '/') {
        registry += '/';
      }

      request(
        {
          url: registry,
          headers: requestsHeaders,
          json: true
        },
        (err, apiResponse: { type: string }) => {
          if (err || !apiResponse) {
            return callback('oc registry not available', null);
          } else if (apiResponse.type !== 'oc-registry') {
            return callback('not a valid oc registry', null);
          }

          fs.readJson(settings.configFile.src, (err, res) => {
            if (err) {
              res = {};
            }

            if (!res.registries) {
              res.registries = [];
            }

            if (!_.includes(res.registries, registry)) {
              res.registries.push(registry);
            }

            fs.writeJson(settings.configFile.src, res, callback as any);
          });
        }
      );
    },
    get(callback: Callback<string[], string>) {
      if (opts.registry) {
        return callback(null, [opts.registry]);
      }

      fs.readJson(settings.configFile.src, (err, res) => {
        if (err || !res.registries || res.registries.length === 0) {
          return callback('No oc registries', undefined as any);
        }

        return callback(null, res.registries);
      });
    },
    getApiComponentByHref(
      href: string,
      callback: Callback<unknown, Error | number>
    ) {
      request(
        {
          url: href + settings.registry.componentInfoPath,
          headers: requestsHeaders,
          json: true
        },
        callback
      );
    },
    getComponentPreviewUrlByUrl(
      componentHref: string,
      callback: Callback<string, Error | number>
    ) {
      request(
        {
          url: componentHref,
          headers: requestsHeaders,
          json: true
        },
        (err, res: { requestVersion: string; href: string }) => {
          if (err) {
            return callback(err, undefined as any);
          }

          const parsed = urlParser.parse(res);
          callback(
            null,
            urlBuilder.componentPreview(parsed as any, parsed.registryUrl)
          );
        }
      );
    },
    putComponent(
      options: {
        username?: string;
        password?: string;
        route: string;
        path: string;
      },
      callback: Callback<unknown, string>
    ) {
      if (!!options.username && !!options.password) {
        requestsHeaders = _.extend(requestsHeaders, {
          Authorization:
            'Basic ' +
            new Buffer(options.username + ':' + options.password).toString(
              'base64'
            )
        });
      }

      put(options.route, options.path, requestsHeaders, (err, res) => {
        if (err) {
          if (!_.isObject(err)) {
            try {
              err = JSON.parse(String(err));
            } catch (er) {}
          }
          const parsedError = err as any as { code?: string; error?: string };

          if (!!parsedError.code && parsedError.code === 'ECONNREFUSED') {
            err = 'Connection to registry has not been established';
          } else if (
            parsedError.code !== 'cli_version_not_valid' &&
            parsedError.code !== 'node_version_not_valid' &&
            !!parsedError.error
          ) {
            err = parsedError.error;
          }

          return callback(err as any, undefined as any);
        }

        callback(err, res);
      });
    },
    remove(registry: string, callback: Callback) {
      if (registry.slice(registry.length - 1) !== '/') {
        registry += '/';
      }

      fs.readJson(settings.configFile.src, (err, res) => {
        if (err) {
          res = {};
        }

        if (!res.registries) {
          res.registries = [];
        }

        res.registries = _.without(res.registries, registry);
        fs.writeJson(settings.configFile.src, res, callback as any);
      });
    }
  };
}