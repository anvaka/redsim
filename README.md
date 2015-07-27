# reddit discovery

Your comments on reddit are not only what makes reddit fun. They can also be
used to x-ray the friendly alien and reveal its hidden structure.

# Redditors who commented to this subreddit also commented to...

This simple idea is the core of the current recommendation website. Despite
the simplicity it yields amazing results.

Before you read any further, please go ahead and check for yourself:

* [Subreddits related to /r/programming](//anvaka.github.io/redsim/#?q=programming)
* [Subreddits related to /r/Games](//anvaka.github.io/redsim/#?q=Games)
* [Subreddits related to /r/linux](//anvaka.github.io/redsim/#?q=linux)

It works really well for subreddits with under 1 million subscribers. But how
exactly does it work?

# How exactly does it work?

Recently `/u/Stuck_In_the_Matrix` publicly released [reddit's ~1.7 billion comments dataset](https://www.reddit.com/r/datasets/comments/3bxlg7/i_have_every_publicly_available_reddit_comment/).
Each record contains information about author's name and target subreddit.

If you post to subreddit `A` and `C` very often - it doesn't necessary mean that
`A` and `C` are related. But if there are thousands of people posting to both
`A` and `C` we could suspect that maybe subreddits are related.

Of course sometimes `A` is way more popular than `C`, and we need to take that
into account. Let's consider three subreddits:

* `A` - has 1,000 subscribers
* `B` - also has 1,000 subscribers; and
* `C` - has only 100 subscribers

Imagine `A` and `B` share 100 reddittors who posted to both `A` and `B`.
Also imagine `A` and `C` share other 100 redditors who posted to both `A`
and `C`.

Which subreddit is more related to `A`? Is it `B` or `C`?

Only 10% of `B` has posted to `A`. While 100% of `C` has posted to `A`.
This means `C` has very high "relationship index" with `A`.

Turns out this "relationship index" has many names and forms. One of the
simplest forms is called [Jaccard index](https://en.wikipedia.org/wiki/Jaccard_index) (similarity).

### Jaccard similarity

To find how much subreddits `A` and `B` are similar with each other, all we need to do is:

1. Find how many subscribers who posted to `A` has also posted to `B` (intersection of `A` and `B`).
2. Find how many subscribers has posted to `A` or `B` (union of `A` and `B`).
3. Divide `1` by `2` and we'll get Jaccard similarity.

In the example above. Jaccard similarity of `A` and `C` is: `J(A, C) = 100/1000 = 0.1`,
while Jaccard similarity of `A` and `B` is: `J(A, B) = 100/(900 + 100 + 900) = 0.053`

This makes `C` two times more similar to `A` than `B`.

### Drawbacks

This approach works extremely well for subreddits with less than 1,000,000 subscribers.
For more popular subreddits results are getting saturated by popularity of those
subreddits. If you have an idea how to fix this please [let me know :)](https://github.com/anvaka/redsim/issues/new).

# Technical details

To compute similarity between subreddits I downloaded only one month worth of
public comments. This gives more than 50,000,000 `user ⇄ subreddit` records.
Which translates to almost 50,000 unique subreddits.

Each record is stored into redis database in these [50 lines of code](https://github.com/anvaka/reddata/blob/db6489e60b96bf3b1d1ef841786b5cd45708fe28/lib/redisClient.js#L81).
And then I'm using [SINTERSTORE](http://redis.io/commands/sinterstore) and
[SUNIONSTORE](http://redis.io/commands/sunionstore) to compute intersection
and union of subreddits ([code](https://github.com/anvaka/reddata/blob/db6489e60b96bf3b1d1ef841786b5cd45708fe28/lib/redisClient.js#L81)). 

This is the most straightforward brute-force approach to compute similarities.
It took almost 70 CPU hours of my old MacBookPro friend to compare all subreddits
with other.

# What's next?

I truly hope you enjoyed the simplicity of the formula and the power of results.
If you have any feedback please let me know!

# license

MIT
