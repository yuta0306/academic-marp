#!/usr/bin/env node

import { marpCli } from '@marp-team/marp-cli'
import { ArgumentParser } from 'argparse'
import fs from 'fs'
import parse from './bibtex/parse.js'
import override from './markdown/wrapper.js'

const parser = new ArgumentParser({
    description: 'Academic Marp CLI'
})

parser.add_argument('-f', '--file', { help: 'input .md file' })
parser.add_argument('-b', '--bibtex', { default: null, help: 'input .bib file' })
parser.add_argument('-o', '--output', { default: false })
parser.add_argument('--theme', { help: 'theme', default: 'gaia' })
parser.add_argument('--generate', { default: false })
parser.add_argument('--per-page', { default: 5 })
parser.add_argument('-w', '--watch', { help: 'watch', default: false })

const args = parser.parse_args()

let result = []
if (!(args.bibtex == null)) result = await parse(args.bibtex)

const out = await override(args.file, result, args.generate, args['per-page'])

let output = args.output
if (!output) output = args.file.replace(/\.md/, '.pdf')

const promise = marpCli(['tmp.md', '--pdf', `--output=${output}`, '--html=true', `--theme=${args.theme}`, `--watch=${args.watch}`, '--allow-local-files=true'])
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