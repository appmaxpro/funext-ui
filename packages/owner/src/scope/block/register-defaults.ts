
import {setC} from '~/utils/h'
import {Items} from '~/components/shared/items'
import registerDefaultHandlers  from './block-handler';
 
export default function registerDefaults() {
  registerDefaultHandlers()
  setC(Items, "List", "Card");
}