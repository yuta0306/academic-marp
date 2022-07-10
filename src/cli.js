#!/usr/bin/env node

import { marpCli } from '@marp-team/marp-cli'
import { ArgumentParser } from 'argparse'
import fs from 'fs'
import parse from './bibtex/parse.js'
import override from './marp/wrapper.js'

const parser = new ArgumentParser({
    description: 'Academic Marp CLI'
})

parser.add_argument('-f', '--file', { help: 'input .md file' })
parser.add_argument('-b', '--bibtex', { help: 'input .bib file' })

const args = parser.parse_args()

const result = await parse(args.bibtex)

const out = await override(args.file, result)

const promise = marpCli(['tmp.md', '--pdf'])
    .then((exitStatus) => {
        if (exitStatus > 0) {
            console.error(`Failure (Exit status: ${exitStatus})`)
        } else {
            console.log('Success')
        }
    })
    .catch(console.error)

await promise

fs.rm('./tmp.md', { recursive: true }, (err) => {
    if (err) {
        // File deletion failed
        console.error(err.message)
        return;
    }
    console.log("File deleted successfully")
})