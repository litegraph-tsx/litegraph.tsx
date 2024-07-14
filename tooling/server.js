import express from 'express';

const app = express()

app.use('/css', express.static('css'))
app.use('/src', express.static('src'))
app.use('/assets', express.static('assets'))
app.use('/editor', express.static('editor'))
app.use('/', express.static('editor'))

app.listen(8000, () => console.log('Example app listening on http://127.0.0.1:8000'))
