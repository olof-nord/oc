import parseAuthor from 'parse-author';
import _ from 'lodash';
import { fromPromise } from 'universalify';

import * as getComponentFallback from './helpers/get-component-fallback';
import infoView from '../views/info';
import isUrlDiscoverable from './helpers/is-url-discoverable';
import * as urlBuilder from '../domain/url-builder';
import type { Repository } from '../domain/repository';
import { Component, Config } from '../../types';
import { Request, Response } from 'express';

function getParams(component: Component) {
  let params = {};
  if (component.oc.parameters) {
    const mandatoryParams = _.filter(
      Object.keys(component.oc.parameters || {}),
      paramName => {
        const param = component.oc.parameters[paramName];
        return !!param.mandatory && !!param.example;
      }
    );

    params = _.mapValues(
      _.pick(component.oc.parameters, mandatoryParams),
      x => x.example
    );
  }

  return params;
}

function getParsedAuthor(component: Component) {
  const author = component.author || {};
  return typeof author === 'string' ? parseAuthor(author) : author;
}

interface InfoError {
  registryError?: string;
  fallbackError?: string;
}

function componentInfo(
  err: InfoError | string | null,
  req: Request,
  res: Response,
  component: Component
): void {
  if (err) {
    res.errorDetails = (err as any).registryError || err;
    res.status(404).json(err);
    return;
  }

  const isHtmlRequest =
    !!req.headers.accept && req.headers.accept.indexOf('text/html') >= 0;

  if (isHtmlRequest && !!res.conf.discovery) {
    const params = getParams(component);
    const parsedAuthor = getParsedAuthor(component);
    let href = res.conf.baseUrl;

    const repositoryUrl = _.get(
      component,
      'repository.url',
      typeof component.repository === 'string' ? component.repository : null
    );

    fromPromise(isUrlDiscoverable)(href, (_err, result) => {
      if (!result.isDiscoverable) {
        href = `//${req.headers.host}${res.conf.prefix}`;
      }

      res.send(
        infoView({
          component,
          dependencies: Object.keys(component.dependencies || {}),
          href,
          parsedAuthor,
          repositoryUrl,
          sandBoxDefaultQs: urlBuilder.queryString(params),
          title: 'Component Info'
        })
      );
    });
  } else {
    res.status(200).json(
      Object.assign(component, {
        requestVersion: req.params['componentVersion'] || ''
      })
    );
  }
}

export default function componentInfoRoute(
  conf: Config,
  repository: Repository
) {
  return function (req: Request, res: Response): void {
    fromPromise(repository.getComponent)(
      req.params['componentName'],
      req.params['componentVersion'],
      (registryError: any, component) => {
        if (registryError && conf.fallbackRegistryUrl) {
          return getComponentFallback.getComponentInfo(
            conf,
            req,
            res,
            registryError,
            (fallbackError, fallbackComponent) =>
              componentInfo(fallbackError, req, res, fallbackComponent)
          );
        }

        componentInfo(registryError, req, res, component);
      }
    );
  };
}
