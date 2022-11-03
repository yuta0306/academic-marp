import fs from 'fs/promises'

async function override(filename, bibtex, generate, per_slide) {
    let matched, data
    let history = []
    let referenced = {}
    await fs.readFile(filename, 'utf-8')
        .then(markdown => {
            matched = markdown.match(/\[ref:.*?\]\(.*?\)/g)
            data = markdown
        })
    // console.log(matched)

    if (matched == null) matched = []
    let refs = matched.map(v => v.replace(/\[ref:|].*/g, ''))
    // console.log(refs)
    refs.map(v => {
        let hit = bibtex.filter(bib => v == bib.id)
        if (hit.length > 0) {
            hit.map(h => {
                if (!history.includes(h.id)) {
                    referenced[h.id] = h
                    history.push(h.id)
                }
            })
        }
    })

    matched.map((v, i) => {
        let ref = refs[i]
        if (history.includes(ref)) {
            let html
            let obj = v.replace(/\[.*\]|\(|\)/g, '')
            let attrs = obj.split(',').map(v => v.replace('\s+', ''))
            if ((attrs.length == 1) && (attrs[0] == 'index')) {
                html = `<span class="reference-item--index-only" data-ref-number="${history.indexOf(ref) + 1}"></span>`
            } else {
                let display = attrs.map(v => `${referenced[ref][v]}`).join(', ')
                html = `<span class="reference-item" data-ref-number="${history.indexOf(ref) + 1}">${display}</span>`
            }
            data = data.replace(v, html)
        }
    })

    if (generate) {
        let slides = '\n\n---\n<!-- class: references -->\n# References\n\n'
        history.map((v, i) => {
            slides += `* <span class="reference-item" data-ref-number="${i + 1}">${referenced[v].title}, ${referenced[v].year}</span>\n`
            if (i % per_slide) slides += "\n---\n\n"
        })
        slides += "\n"
        data += slides
    }

    const promise = fs.writeFile('./tmp.md', data, "utf-8")
    await promise

    return data
}

export default override