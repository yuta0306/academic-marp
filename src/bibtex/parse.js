import fs from 'fs/promises'

async function parse(filename) {
    let bibtex
    const comment = /%.*\n/g
    const breakline = /\n|\t/g
    await fs.readFile(filename, 'utf-8')
        .then(data => {
            // remove comment
            data = data.replace(comment, '')
            // remove breaklines
            data = data.replace(breakline, '')
            // split bibliography
            let content = data.split('@')
            content = content.filter(v => v != '').map(v => `@${v}`)
            bibtex = content.map(v => new Bibliography(v))
        })
    return bibtex
}

class Bibliography {
    constructor(bibtex) {
        this.bibtex = bibtex
        let attrs = this.fetch_attr()
        this.set_attrs(attrs)
    }

    fetch_attr() {
        // split
        let normalized = this.bibtex.split(/{|}\s*,|"\s*,|"|}/)
        let splited = normalized[1].split(/,/)
        // normalize text
        normalized = normalized.splice(0, 1).concat(splited).concat(normalized.splice(1, normalized.length))
        normalized = normalized.map(v => v.replace(/^\s+|\s+$/g, '')).filter(v => v != '')

        // set attr
        this.entry_type = normalized[0].replace('@', '')
        this.id = normalized[1]

        let attrs = {}
        let [key, value] = ["", ""]
        normalized.splice(2, normalized.length).map(v => {
            if (v[v.length - 1] == '=') {
                if (key != "") {
                    attrs[key] = value
                    value = ""
                }
                key = v.replace(/\s+|=/g, '')
            }
            else {
                value += v
            }
        })
        attrs[key] = value
        return attrs
    }

    set_attrs(attrs) {
        this.address = attrs.address
        this.annote = attrs.annote
        this.author = attrs.author
        this.booktitle = attrs.booktitle
        this.chapter = attrs.chapter
        this.crossref = attrs.crossref
        this.edition = attrs.edition
        this.editor = attrs.editor
        this.howpulished = attrs.howpulished
        this.institution = attrs.institution
        this.journal = attrs.journal
        this.key = attrs.key
        this.month = attrs.month
        this.note = attrs.note
        this.number = attrs.number
        this.organization = attrs.organization
        this.pages = attrs.pages
        this.publisher = attrs.publisher
        this.school = attrs.school
        this.series = attrs.series
        this.title = attrs.title
        this.type = attrs.type
        this.volume = attrs.volume
        this.year = attrs.year
    }
}

export default parse