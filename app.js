const rp = require('request-promise');
const nodeBase64 = require('nodejs-base64-converter');
const fs = require('fs');
var xlsx = require('node-xlsx').default;

let URL = "https://dappradar.com/v2/api/dapps?params=";
const dapps = [];
const pages = 440

function make_api_call(params) {
    return rp({
        url: `${URL}${params}`,
        method: 'GET',
        json: true
    })
}

async function getDapps() {
    let result;
    for (let i = 1; i <= pages; i++) {
        const paramsString = `DappRadarpage=${i}&sgroup=max&currency=USD&featured=1&range=month&sort=user&order=desc&limit=26`
        const encodedParams = nodeBase64.encode(nodeBase64.encode(paramsString))
        result = await make_api_call(encodedParams);
        console.log("progress => ", i / pages * 100)
        dapps.push(...result.dapps)
    }
    return dapps;
}

async function doTask() {
    let results = await getDapps();
    const data = [["Name", "Network(s)", "Category", "User Activity (30 days)"]]

    for (let i = 0; i < results.length; i++) {
        data.push([
            results[i].name,
            results[i].protocols.join(),
            results[i].category,
            results[i].statistic.userActivity
        ])
    }

    var buffer = xlsx.build([{ name: 'mySheetName', data: data }]);

    fs.writeFile("dapps.xlsx", new Buffer(buffer, 'binary'), err => {
        if (err) {
            console.error(err);
        } else {
            console.log("File written");
        }
    });

}

doTask();