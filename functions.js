import Fs from "fs"
import fetch from "node-fetch"

export async function timeout(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

export const imagesProductLinks = async (page, link, teamName) => {
  console.log(`go to download product ${teamName}`)
  await page.goto(link)

  const imageLinks = await page.evaluate(() => {
    let titleProduct = document.querySelector("h1").innerText
    titleProduct = titleProduct.substring(0, titleProduct.indexOf("Item"))
    //return titleProduct

    const LinksImagesOfProduct = {
      title: titleProduct,
      products: [],
    }
    const productsOfPage = document.querySelectorAll(
      "#goodsimagelist a[data_img]"
    )

    productsOfPage.forEach((product) => {
      const image = product.attributes.data_img.nodeValue
      LinksImagesOfProduct.products.push(image.substring(0, image.indexOf("?")))
    })

    return LinksImagesOfProduct
  })

  return imageLinks
}

export const downloadImagesForProduct = async (product, teamName) => {
  let key = 0
  if (!Fs.existsSync(`./images/${teamName}`)) {
    Fs.mkdirSync(`./images/${teamName}`)
  }

  if (Fs.existsSync(`./images/${teamName}/${product.title}`)) {
    console.log(`\n Produit ${product.title} existe déjà\n`)
    return
  }

  Fs.mkdirSync(`./images/${teamName}/${product.title}`)
  for (const link of product.products) {
    console.log(link)
    key++
    const response = await fetch(link).then((res) => {
      const writer = Fs.createWriteStream(
        `./images/${teamName}/${product.title}/${key}.jpg`
      )
      res.body.pipe(writer)
    })
  }
}

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
