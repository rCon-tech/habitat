import bucketList from '../bucket-list/module.json';
import chores from '../chores/module.json';
import dinnerRota from '../dinner-rota/module.json';
import groupNotes from '../group-notes/module.json';
import linkStash from '../link-stash/module.json';
import quoteWall from '../quote-wall/module.json';
import scoreboard from '../scoreboard/module.json';
import shoppingList from '../shopping-list/module.json';
import { loadMdl } from './load';

/**
 * Every widget that is defined as JSON. Each document is validated here, at startup, so a bad one
 * fails loudly with the path of the mistake. No React in this file: the server registry uses it too.
 */
export const declarativeModules = [
  bucketList,
  shoppingList,
  chores,
  dinnerRota,
  scoreboard,
  quoteWall,
  linkStash,
  groupNotes,
].map(loadMdl);
