/
dcast Download!
A docker-compose and dockerfile that will run a node-cron task to download radio shows, make a podcast / RSS feed for them, and publish them to s3 (or digitalocean's spaces).


# Getting Started
Copy the example env and streamConfig files
```
cp ./podcasts.env.example ./podcasts.env
cp  ./podcasts/download-stream/streamConfigs.json.example  ./podcasts/download-stream/streamConfigs.json
```
* Add your S3 info to the podcasts.env file
* Add your stream config info to the streamConfigs file

### podcasts.env
```
SPACES_ACCESS=XXX
SPACES_KEY=XXX
SPACES_BUCKET=XXX
SPACES_ENDPOINT=XXX
```

### streamConfigs.json
```
{
  "Radio Show Title": {
    "title": "Radio Show Title",
    "host": "Host Name",
    "hostEmail": "null@example.com",
    "stream": "URL TO STREAM",
    "link": "Link to Radio Show",
    "radioStation": "Radio Station Description",
    "summary": "Show Summary",
    "description": "Show Description",
    "explicit": "no",
    "streamFormat": "aac", //If the stream isn't MP3, specify the format here and it'll convert it to mp3
    "image": "Image that will be used in the ID3 tag for the podcast",
    "genre": "id3 genre",
    "startTime": "Start Time in 'timezone' and 24 hour time",
    "length": Length in Minutes,
    "dayOfWeek": "Tues", //Day of Week (Mon/Tues/Wed/Thurs/Fri) You can also use Monday or Monda or Frida or Th, obviously S or T will cause issues, so use at least 2 letters",
    "timezone": "America/New_York", //Timezone
    "bufferSeconds": 60 //Buffer (in seconds) before and after the episode, so you don't miss it if it starts early or runs late
  }
}
```

# Running it all
Once that's all set up, you just need to run
```
docker-compose build
docker-compose up
```

