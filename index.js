const twit = require("twit");
const axios = require("axios");
const _ = require("lodash");

const Twitter = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const stream = Twitter.stream("statuses/filter", {
  track: "#blackcard, #whitecard, @TweetsAHumanity",
  language: "en"
});

const getAnswer = (responseId, originalAuthor) => {
  console.log("got to getAnswer");
  axios.get(process.env.API_ENDPOINT + "/build").then(data => {
    console.log(responseId);

    let answer = data.data.answer + " #CAH #TAH";

    if (originalAuthor) {
      answer = "@" + originalAuthor + " " + answer;
    }
    answer.length <= 140
      ? createPost(answer, responseId)
      : getAnswer(responseId, originalAuthor);
  });
};

const createPost = (answer, responseId) => {
  const post = {
    status: answer
  };
  if (responseId) {
    post.in_reply_to_status_id = responseId;
  }
  console.log("Got to post", post);
  Twitter.post("statuses/update", post, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Tweet succesfully replied to");
  });
};

setInterval(getAnswer, process.env.INTERVAL * 60 * 60 * 1000);

const answerTweet = (responseId, originalAuthor) => {
  axios.get(process.env.API_ENDPOINT + "/white?pick=1").then(data => {
    let answer = data.data[0].text + " #CAH #TAH";

    if (originalAuthor) {
      answer = "@" + originalAuthor + " " + answer;
    }
    answer.length <= process.env.TWEET_LENGTH
      ? createPost(answer, responseId)
      : answerTweet(responseId, originalAuthor);
  });
};

const emptyReply = (answer, responseId, originalAuthor) => {
  const tweet = "@" + originalAuthor + " " + answer + " #CardsAgainstHumanity #TweetsAgainstHumanity";
  createPost(tweet, responseId);
};

const answerText = tweet => {
  const originalAuthor = tweet.user.screen_name;
  const tweetText = tweet.text.split(" ");
  const responseId = tweet.id_str;

  if (tweetText.indexOf("@TweetsAHumanity") !== -1) {
    const mappedTweetText = tweetText.map(text => text.toLowerCase());

    const blackCardCheck = mappedTweetText.indexOf("#blackcard") !== -1;
    const whiteCardCheck = mappedTweetText.indexOf("#whitecard") !== -1;

    const filteredText = mappedTweetText.filter(text => {
      return !_.startsWith(text, "#");
    });

    const isQuestion = _.chain(filteredText)
      .last()
      .endsWith("?")
      .value();

    if (blackCardCheck && whiteCardCheck) {
      getAnswer(responseId, originalAuthor);
    } else if (isQuestion) {
      answerTweet(responseId, originalAuthor);
    } else {
      emptyReply("What do you want from me!?", responseId, originalAuthor);
    }
  } else {
    console.error("That tweet didn't contain my username");
  }
};

stream.on("tweet", answerText);

// answerText({ text: "@TweetsAHumanity What's the meaning of life? #whitecard" });
