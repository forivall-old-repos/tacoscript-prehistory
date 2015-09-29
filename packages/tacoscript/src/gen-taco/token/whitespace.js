// automatically apply word break semantics to words when for generation
import uniq from 'lodash/array/uniq';
import getToken from '../../helpers/get-token';
import { sp, tab, nl } from './types';

export let wordTokenTypes = uniq(['async', 'function', 'get', 'set'].map(s => getToken(s).type));
console.log(wordTokenTypes.map(tt => tt.label));
export let whitespaceTokenTypes = [sp, tab, nl, 'Whitespace', 'CommentBlock', 'CommentLine'];
