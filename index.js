import puppeteer from "puppeteer"
import {
  timeout,
  imagesProductLinks,
  downloadImagesForProduct,
  asyncForEach,
} from "./functions.js"

const dwPageProductLinks = async (page) => {
  console.log(`------------recuperation lien----------`)
  const images = await page.evaluate(() => {
    const productLinksArray = []
    const productLinks = document.querySelectorAll(".common_pro_list2 a.pic")
    productLinks.forEach((link) => {
      productLinksArray.push(link.href)
    })

    return productLinksArray
  })

  return images
}

// const PLTeams = ["LIV", "Man-City", "Man-Utd", "CHE"]
const PLTeams = ["LIV", "Man-City"]

//Scrap
const URL = "https://www.kkgoolc.com/"
const main = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
  })

  const page = await browser.newPage()
  for (const team of PLTeams) {
    await page.goto(URL, { waitUntil: "networkidle2" })
    console.log(`Download Premier League products`)
    //Premier League
    await page.click('[href^="/Premier-League"]')
    await timeout(2000)
    console.log(`download produit de ${team}`)
    await page.click(`.shopbycate_2 a[href^="/${team}"]`)
    await timeout(5000)
    const nbPagesProduct = await page.evaluate(() => {
      const number = document.querySelectorAll(
        ".common_pages a:not(.cur):not(.next)"
      ).length

      return number
    })
    console.log(
      `-----------download page product links teams: ${team}-------------`
    )
    const linkJersey = await dwPageProductLinks(page)
    // console.log(linkJersey)
    let i = 0
    while (i < nbPagesProduct) {
      page.click(`.common_pages .next`)
      await timeout(5000)
      const linkJerseyNext = await dwPageProductLinks(page)
      linkJersey.push(...linkJerseyNext)
      i++
    }
    console.log(
      `-----------FIN download page product links teams: ${team}-------------`
    )
    await asyncForEach(linkJersey, async (link) => {
      const imagesProductLink = await imagesProductLinks(page, link, `${team}`)
      console.log(
        `----download Images For Product-----${imagesProductLink["title"]}\n`
      )
      await downloadImagesForProduct(imagesProductLink, `${team}`)
      console.log(
        `----FIN download Images For Product-----${imagesProductLink["title"]}\n`
      )
    })
  }

  await browser.close()
}

await main()
