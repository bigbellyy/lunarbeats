## This is a personal passion project created to explore web development.

The codebase prioritizes rapid iteration of features and systems over polish.



[lunarbeats](https://lunarbeats.app/)

[Old YouTube teaser (if the link doesn’t work)](https://www.youtube.com/watch?v=bVyxlHv9yqc)

lunarbeats is a free online rhythm game where users can create beatmaps to share and play with others.

In order to handle music playing, lunarbeats uses the YouTube embeded player to seamlessly and effortlessly
play songs without the need for any downloads.

Players entering the beatmap editor will be prompted to input a YouTube video URL that will be used as the music for the beatmap.

Online storage of beatmaps is currently provided by MongoDB Atlas.
- There is a 5MB limit for each player.
- The free version of MongoDB only allows around 5GB of storage.
- MongoDB Atlas is not meant as a long term solution.

The backend is made using NodeJS along with ExpressJS and a few other dependencies.
You can view the backend by viewing the app.js file in the root folder.

Everything front end is located in the "public" directory.
A few files such as music, songs, and images are missing due to Github file limitations and potential copyright infringement.

Created by Herman Ben Toledo

I began this project late 2022. The game is heavily inspired by osu mania. The original name for this app was "Suzune".

## License
This project does not have an open-source license. It is available publicly for educational and portfolio purposes only. Reuse, modification, or distribution without permission is prohibited.
