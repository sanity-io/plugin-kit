import {cliEntry} from '../src/cli'

// ts-node <script> get sliced away, just like node <command> will be, so we can pass process.argv directly
cliEntry(process.argv, false)
