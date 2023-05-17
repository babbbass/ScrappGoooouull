import puppeteer from "puppeteer"
import {
  timeout,
  linksTeam,
  dwPageProductLinks,
  downloadLinksImagesProduct,
  downloadImagesForProduct,
  nbPageByProduct,
} from "./functions.js"
import { URL_SITE } from "./config.js"

const TEAM_TO_SKIP = []
const LEAGUE = "Other-Clubs"
//Scrap
const main = async () => {
  console.log(`------ START scrapp ${LEAGUE} ------`)
  const browser = await puppeteer.launch({
    headless: "new",
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 1200,
    height: 900,
    deviceScaleFactor: 1,
  })

  page.setDefaultNavigationTimeout(0)
  await page.goto(URL_SITE, { waitUntil: "networkidle2" })
  //Ligue
  await page.click(`[href^="/${LEAGUE}"]`)
  await timeout(2000)
  //fetch all teams for the league
  const teamsLinks = await linksTeam(page)

  console.log(`Download ${LEAGUE} products`)
  for (const team of teamsLinks) {
    if (TEAM_TO_SKIP && TEAM_TO_SKIP.includes(team.teamName)) {
      console.log(`already downloaded ${team.teamName} picture`)
      continue
    }
    await page.goto(team.link, { waitUntil: "networkidle2" })
    console.log(`download produit de ${team.teamName}`)
    const pagesByProduct = await nbPageByProduct(page)
    console.log(
      `-----------download links page product team: ${team.teamName}-------------`
    )

    const linkJersey = await dwPageProductLinks(page)
    let i = 0
    while (i < pagesByProduct) {
      page.click(`.common_pages .next`)
      await timeout(5000)
      const linkJerseyNext = await dwPageProductLinks(page)
      linkJersey.push(...linkJerseyNext)
      i++
    }
    console.log(
      `-----------FIN download links page product team: ${team.teamName}-------------`
    )
    await timeout(5000)

    for (const link of linkJersey) {
      const imagesProductLink = await downloadLinksImagesProduct(
        page,
        link,
        `${team.teamName}`
      )
      console.log(
        `----download Images For ${imagesProductLink["title"]} -----\n`
      )
      await downloadImagesForProduct(imagesProductLink, `${team.teamName}`)
      console.log(
        `----FIN download Images For ${imagesProductLink["title"]} -----\n`
      )
    }
  }

  await browser.close()
}

await main()
