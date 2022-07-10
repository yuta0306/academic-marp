import fs from 'fs/promises'

async function override(filename, bibtex) {
    let matched, data
    let history = []
    let referenced = {}
    await fs.readFile(filename, 'utf-8')
        .then(markdown => {
            matched = markdown.match(/\[ref:.*\]\(.*\)/g)
            data = markdown
        })
    let refs = matched.map(v => v.replace(/\[ref:|].*/g, ''))
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
            let obj = v.replace(/\[.*\]|\(|\)/g, '')
            let attrs = obj.split(',').map(v => v.replace('\s+', ''))
            let display = attrs.map(v => `${referenced[ref][v]}`).join(', ')
            let html = `<span data-ref-number="${history.indexOf(ref) + 1}">${display}</span>`
            data = data.replace(v, html)
        }
    })

    const promise = fs.writeFile('./tmp.md', data, "utf-8")
    await promise

    return data
}

export default override