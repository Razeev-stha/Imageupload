const express = require('express')
const Formidable = require('formidable')
const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const { join } = require('path')
const cors=require('cors')

const app = express()
const port = 5000

app.use(express.json())
app.use(cors())

//returns whether the uploads folder exists or not in true or false 
const checkUploadsFolderExists = async (imageFolder) => {
    try {
        await fs.statAsync(imageFolder)
    } catch (err) {
        if (err && err.code == 'ENOENT') {
            console.log('The uploads folder doesn\'t exist, creating a new one...')
            try {
                await fs.mkdirAsync(imageFolder)
            } catch (err) {
                console.error('Error creating the uploads folder')
                return false
            }
        } else {
            console.log('Error reading the upload folder')
            return false
        }
    }
    return true
}

const checkFileType =(file) => {
    //returns true or false if success or not 
    const type = file.type.split('/').pop()
    const validTypes = ['png', 'jpeg', 'jpg', 'gif']
    if (validTypes.indexOf(type) == -1) {
        console.log('The file type is invalid')
        return false
    } else {
        return true
    }
}

app.post('/upload', async (req, res) => {
    let form = Formidable.IncomingForm()
    const imageFolder = join(__dirname, 'Uploads')
    form.multiples = true
    form.maxFileSize = 50 * 1024 * 1024// 50MB
    form.uploadDir = imageFolder
    const folderExists = await checkUploadsFolderExists(imageFolder)
    if (!folderExists) {
        return res.json({
            ok: false,
            msg:'There was an error creating the image folder'
        })
    }
    form.parse(req, async (err, fields, files) => {
        let myUploadedImages=[]
        if (err) {
            console.log('Error parsing the files', err)
            console.log('fields:', fields)
            console.log('files:', files)

            return res.json({
                ok: false,
                msg:'Error parsing the files'
            })
        }
        if (!files.files.length) {
            //checks if one file
            const file = files.files
            const isValid = checkFileType(file)
            const fileName=encodeURIComponent(file.name.replace(/&. *;+/g, '-'))
            if (!isValid) {
                return res.json({
                    ok: false,
                    msg:'The file received is invalid file type'
                })
            }
            try {
                await fs.renameAsync(file.path,join(imageFolder,fileName))
            } catch (err) {
                console.log('The file uplaod failed trying to remove the temporary file ... ')
                try { await fs.unlinkAsync(file.path) } catch (err) { }
                return res.json({ok:false,msg:"The file couldn't be uploaded"})
            }
            myUploadedImages.push(fileName)
        } else {
            //checks if multiple file
            for (let i = 0; i < files.files.length; i++){
                const file = files.files[i]
                const isValid = checkFileType(file)
                const fileName=encodeURIComponent(file.name.replace(/&. *;+/g, '-'))
                if (!isValid) {
                    return res.json({
                        ok: false,
                        msg:'The file received is invalis file type'
                    })
                }
                try {
                    await fs.renameAsync(file.path,join(imageFolder,fileName))
                } catch (err) {
                    console.log('The file uplaod failed trying to remove the temporary file ... ')
                    try { await fs.unlinkAsync(file.path) } catch (err) { }
                    return res.json({ok:false,msg:"The file couldn't be uploaded"})
                }
                myUploadedImages.push(fileName) 
            }
        }
        return res.json({
            ok: true,
            msg: "The files have been uploaded successfully",
            files:myUploadedImages
        })
    })
})

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`)
})
