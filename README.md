# TooTimer

TooTimer is a cross-platform application that helps you posting and managing scheduled toots in mastodon.

To use this application:

1. Create your mastodon application to get token

- Go to settings/applications -> create a new application -> input any name, select `read`, `profile`, `write:media`, `write:status` permissions -> click save

- Go go the created application, get the `Access Token`, something like this: `wjz3cB1dUTGrookLcnk2rRf2bOqInm9DnOyFBq9WpC8`

2. Open TooTimer, you will be redirected to configuration page, input your instance URL (with https://), e.g. `https://techhub.social`, and the token you just got from step 1 -> click save

And you are all set!

Usage:

Just put any text in the big input box, also supporting paste image from clipboard, it will be uploaded to the mastodon server also, then the image will shows in the below.

Select the sceduled date (time is always set to `00:00:00` for now), and click `Post!`

> If you did not select any date, the post will be send NOW.

And you can also see all your scheduled posts below the page, click to see the details (with images). You can also click `Delete` button to delete the unposted scheduled post.

Have Fun!