import { Request, Response } from 'express';
import { Config } from '../../types';

export default function plugins(conf: Config) {
  return (req: Request, res: Response): void => {
    if (conf.discovery) {
      const plugins = Object.entries(conf.plugins).map(
        ([pluginName, pluginFn]) => ({
          name: pluginName,
          description: pluginFn.toString()
        })
      );

      res.status(200).json(plugins);
    } else {
      res.status(401);
    }
  };
}
