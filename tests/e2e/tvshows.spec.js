const { test, expect } = require('../support')

const data = require('../support/fixtures/series.json')

const { executeSQL } = require('../support/database')

test.beforeAll(async () => {
    await executeSQL(`DELETE FROM public.tvshows`)
})

test('Deve poder cadastrar uma nova série', async ({ page }) => {
    const serie = data.create

    await page.login.do('admin@zombieplus.com', 'pwd123', 'Admin')
    await page.series.create(serie)
    const message = `A série '${serie.title}' foi adicionada ao catálogo.`
    await page.popup.haveText(message)
})

test('Deve poder remover uma série', async ({ page, request }) => {
    const serie = data.to_remove

    await request.api.postSerie(serie)

    await page.login.do('admin@zombieplus.com', 'pwd123', 'Admin')

    await page.series.goTvshows()
    await page.series.remove(serie.title)
    const message = 'Série removida com sucesso.'
    await page.popup.haveText(message)

})

test('Não deve cadastrar quando o título é duplicado', async ({ page, request }) => {
    const serie = data.duplicate

    await request.api.postSerie(serie)

    await page.login.do('admin@zombieplus.com', 'pwd123', 'Admin')
    await page.series.create(serie)
    const message = `O título '${serie.title}' já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`
    await page.popup.haveText(message)
})

test('Não deve cadastrar quando os campos brigatórios não são preenchidos', async ({ page }) => {
    await page.login.do('admin@zombieplus.com', 'pwd123', 'Admin')

    await page.series.goForm()
    await page.series.submit()

    await page.series.alertHaveText([
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório'
    ])
})

test('Deve realizar busca pelo termo zumbi', async ({ page, request }) => {
    const series = data.search

    series.data.forEach(async (s) => {
        await request.api.postSerie(s)
    })

    await page.login.do('admin@zombieplus.com', 'pwd123', 'Admin')
    await page.series.goTvshows()
    await page.series.search(series.input)

    await page.series.tableHave(series.outputs)
})