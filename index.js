
const fs = require("fs");
const path = require("path");
const open = require("open");
const axios = require('axios');
const inquirer = require('inquirer');
const convertFactory = require('electron-html-to');
const { generateHTML } = require("./generateHTML");

var conversion = convertFactory({
    converterPath: convertFactory.converters.PDF
});

const questions = [
    {
        type: "input",
        name: "username",
        message: "Enter your GitHub Username"
    },
    {
        type: "list",
        name: "color",
        message: "What is your favorite color?",
        choices: ['green', 'blue', 'pink', 'red'],
    }

];

// function writeToFile(fileName, data) {
//     return fs.writeFileSync(path.join(process.cwd(), filename),data)
//     //create index.html file using fs

// }

function init() {
    inquirer
        .prompt(questions)
        .then(function ({ username, color }) {
            const queryUrl = `https://api.github.com/users/${username}`;

            axios
                .get(queryUrl)
                .then((response) => {


                    // axios
                    //     .get(`https://api.github.com/users/${username}/repos?per_page=100`)
                    //     .then((response) => {
                            let info = response.data;
                            info.color = color;
                            info.stars = 0;
                            for (let i = 0; i < info.length; i++) {
                                info.stars += info[i].stars_count;
                            }
                            if (!info.location){
                                info.location = "No location listed";
                            }
                            let resumeHTML = generateHTML(info);
                            conversion({ html: resumeHTML }, function (err, result) {
                                if (err) {
                                    return console.error(err);
                                }
                                // console.log(result.numberOfPages);
                                // console.log(result.logs);
                                result.stream.pipe(fs.createWriteStream(path.join(__dirname,'github.pdf')));
                                conversion.kill();
                            })
                            // })
                            open(path.join(process.cwd(), "github.pdf"));
                        });
        })
}
init();

