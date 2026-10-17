import { createElement } from 'react';
import { defineModule } from '../sdk/define';
import type { HabitatModule } from '../sdk/types';
import { DeclarativeCard } from './DeclarativeCard';
import { Renderer } from './Renderer';
import type { MdlModule } from './mdl-schema';

/** Turn a validated JSON definition into a module the app can render. */
export function toModule({ manifest, views }: MdlModule): HabitatModule {
  const cells = views.card?.cells;
  return defineModule({
    manifest,
    Page: () => createElement(Renderer, { manifest, view: views.main }),
    FeedCard: cells ? ({ record }) => createElement(DeclarativeCard, { record, cells }) : undefined,
  });
}
