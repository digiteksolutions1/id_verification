const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res)=>{
    res.send(`<h2>hello from root</h2>`);
});

app.listen(port, ()=>{
    console.log(`Server running on port:${port}`);
});
