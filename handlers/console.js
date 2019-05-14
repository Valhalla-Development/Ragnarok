module.exports = (bot) => {
    let prompt = process.openStdin();
    prompt.addListener("data", res => {
        let x = res.toString().trim().split(/ +/g);
        bot.channels.get("534872912876797962").send(x.join(" "));
    });
};