import schema from 'part:@sanity/base/schema'
import {lol} from './deeper/lol'

export default function two() {
  console.log(schema)
  console.log(lol())
}
