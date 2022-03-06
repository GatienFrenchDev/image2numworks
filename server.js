const jimp = require('jimp')
const multer = require('multer')
const fs = require('fs')
const express = require('express')
const path = require('path')

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.get('/', express.static(path.join(__dirname, './public')))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './img_upload')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const colors = {
    a: '#000000',
    b: '#ffffff',
    c: '#f00',
    d: '#00ff00',
    e: '#00f',
    f: '#ff0',
    g: '#00FFFF',
    h: '#FF00FF',
    i: '#C0C0C0',
    j: '#808080',
    k: '#800000',
    l: '#808000',
    m: '#008000',
    n: '#800080',
    o: '#008080',
    p: '#000080'
}
const nearestColor = require('nearest-color').from(colors)

const upload = multer({ storage: storage })

// settings
const taille = 18
const pas = 1


app.listen(process.env.PORT || 80, () => { console.log('| website up 🔼') })

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})


app.post('/image', upload.single('image'), async (req, res) => {

    if (!req['file']['filename']) { return }

    let script = 'from kandinsky import *\nfill_rect(0,0,320,222,color(255,255,255))\na=color(0,0,0)\nb=color(255,255,255)\nc=color(255,0,0)\nd=color(0,255,0)\ne=color(0,0,255)\nf=color(255,255,0)\ng=color(0,255,255)\nh=color(255,0,255)\ni=color(192,192,192)\nj=color(128,128,128)\nk=color(128,0,0)\nl=color(128,128,0)\nm=color(0,128,0)\nn=color(128,0,128)\no=color(0,128,128)\np=color(0,0,128)'

    let image = []
    jimp.read('img_upload/' + req['file']['filename'], (err, img) => {
        img.scaleToFit(taille, jimp.AUTO, jimp.RESIZE_BEZIER) // redimensionne et garde le ratio
        for (i = 0; i < img.bitmap.width; i += pas) {
            for (j = 0; j < taille; j += pas+1) {


                
                let res = jimp.intToRGBA(img.getPixelColor(i, j))
                let couleur = nearestColor(res)
                res['couleur'] = couleur['name']
              
                /*
                let res = jimp.intToRGBA(img.getPixelColor(i, j))
                */
                
                
                
                
                res['x'] = i
                res['y'] = j
                image.push(res) // renvoie un objet avec les valeurs R G B A

                

            }
        }
        for (i = 0; i < image.length; i++) {
            
            script += `\nset_pixel(${image[i]['x']},${image[i]['y']},${image[i]['couleur']})`
            /*
            script += `\nset_pixel(${image[i]['x']},${image[i]['y']},color(${image[i]['r']},${image[i]['g']},${image[i]['b']}))`
            */
        }
        res.sendFile(__dirname + '/public/index.html')
        fs.writeFile('scripts/' + req['file']['filename'] + '.py', script, () => { })
    })
})