const _ = require('lodash');
const axios = require('axios');
require('dotenv').config();

if (!(process.env.BEARER_TOKEN)) {
  throw new Error('env twitter not found');
}

(async () => {
  try {
    const token = process.env.BEARER_TOKEN;
    const tweetId = '1619323067733532672'; // parent tweet giveaway id
    const excludeUserIds = ['1411142861098143748', '144380031']; // exclude friends from giveaway

    // quote tweets only <= 200
    // so need calling api twice to gather data tweets
    const firstListQuoteTweetsResponse = await axios.get(
      `https://api.twitter.com/2/tweets/${tweetId}/quote_tweets`,
      {
        headers: {
          'Authorization': 'Bearer '+ token,
        },
        params: {
          'max_results': 100,
          'expansions': 'author_id',
          'user.fields': 'username'
        }
      }
    );
    
    const secondListQuoteTweetsResponse = await axios.get(
      `https://api.twitter.com/2/tweets/${tweetId}/quote_tweets`,
      {
        headers: {
          'Authorization': 'Bearer '+ token,
        },
        params: {
          'max_results': 100,
          'expansions': 'author_id',
          'user.fields': 'username',
          'pagination_token': firstListQuoteTweetsResponse.data.meta.next_token
        }
      }
    );

    const listQuoteTweets = [...firstListQuoteTweetsResponse.data.data, ...secondListQuoteTweetsResponse.data.data];
    const filteredQuoteTweets = listQuoteTweets.filter(data => !excludeUserIds.includes(data.author_id));
    const randomUsers = _.sampleSize(filteredQuoteTweets, 5);
    const userIds = randomUsers.map(data => data.author_id);

    const detailUsers = await axios.get(
      `https://api.twitter.com/2/users`,
      {
        headers: {
          'Authorization': 'Bearer '+ token,
        },
        params: {
          'ids': userIds.join(),
          'user.fields': 'username'
        }
      }
    );

    console.log('you folks win giveaway: ');
    console.log(detailUsers.data.data);
  } catch (error) {
    console.log(error);
  }
})();
