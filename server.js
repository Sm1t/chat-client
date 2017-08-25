const path = require('path')
const express =  require('express')
const history =  require('connect-history-api-fallback')

const app = express();
app.use(express.static(__dirname))
app.use(history());
app.use('/dist', express.static(path.resolve(__dirname, './dist')));

app.use((req, res, next) => {
	return res.redirect('localhost:8080');
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})

