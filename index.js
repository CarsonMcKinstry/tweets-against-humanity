const twit = require("twit");
const axios = require("axios");

const Twitter = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// axios.get(process.env.API_ENDPOINT)
// .then(data => {
//   console.log(data);
// });

const getAnswer = () => {
  axios.get(process.env.API_ENDPOINT).then(data => {
    let answer = data.data.answer + " #CAH #TAH";
    answer.length <= 140 ? createPost(answer) : getAnswer();
  });
};

const createPost = answer => {
  Twitter.post(
    "statuses/update",
    {
      status: answer
    },
    (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(res);
    }
  );
};

setInterval(getAnswer, process.env.INTERVAL * 60 * 60 * 1000);
