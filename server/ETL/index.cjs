const axios = require("axios");

const backend = "http://localhost:3000/api";

async function get_months() {
    const res = await axios.get(`${backend}/months`);
    return res.data;
}

async function get_formats(month) {
    const res = await axios.get(`${backend}/formats/${month}/`);
    return res.data;
}

async function get_format_stats(month, format) {
    const res = await axios.get(`${backend}/formats/${month}/${format}`);
    return res.data;
}

async function get() {
    const res1 = await get_months();
    const res2 = await get_formats(res1[10]);
    const res3 = await get_format_stats(res1[10], "ou" + "-" + res2["ou"][2]);
    console.log(res3);
}

get();
