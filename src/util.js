import { v4 as uuidv4 } from 'uuid';
import { Baller, Challa, nolove,werollin } from './assets/songs/music'
function chillHop() {
  return [
    {
      name: 'Challa',
      cover:
        'https://cover.mr-jatt.im/thumb/504208/Challa-1.jpg',
      artist: 'Gurdas Maan ft Diljit Dosanjh',
      audio: Challa,
      color: ['#CD607D', '#c94043'],
      id: uuidv4(),
      active: true,
    },
    {
      name: 'Baller',
      cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_orchard/music/20220825055753_196925634489/1661422519/srch_orchard_196925634489_QMBZ92275950.jpg',
      artist: 'Shubh',
      audio: Baller,
      color: ['#205950', '#2ab3bf'],
      id: uuidv4(),
      active: false,
    },
    {
      name: 'NO LOVE',
      cover: 'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_believe/music/0196776912972/1656859807/srch_believe_A10320WT042924992Y.jpg',
      artist: 'Shubh',
      audio: nolove,
      color: ['#EF8EA9', '#ab417f'],
      id: uuidv4(),
      active: false,
    },
    {
      name: 'We Rollin',
      cover:
        'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/srch_believe/music/0196400716495/1656861613/srch_believe_A10320WT0429249910.jpg',
      artist: 'Shubh',
      audio: werollin,
      color: ['#CD607D', '#c94043'],
      id: uuidv4(),
      active: false,
    },
    {
      name: 'Pagol',
      cover:
        'https://img.wynk.in/unsafe/248x248/filters:no_upscale():strip_exif():format(webp)/http://s3-ap-south-1.amazonaws.com/wynk-music-cms/music/1562531793/srch_abcdigital_CA3SS1932001.jpg',
      artist: 'Deep Jandu Ft Bohemia',
      audio: 'https://mp3.chillhop.com/serve.php/?mp3=9148',
      color: ['#EF8EA9', '#ab417f'],
      id: uuidv4(),
      active: false,
    },

    {
      name: 'Under the City Stars',
      cover:
        'https://chillhop.com/wp-content/uploads/2020/09/0255e8b8c74c90d4a27c594b3452b2daafae608d-1024x1024.jpg',
      artist: 'Aso, Middle School, Aviino',
      audio: 'https://mp3.chillhop.com/serve.php/?mp3=10074',
      color: ['#205950', '#2ab3bf'],
      id: uuidv4(),
      active: false,
    },
    {
      name: 'Under the City Stars',
      cover:
        'https://chillhop.com/wp-content/uploads/2020/09/0255e8b8c74c90d4a27c594b3452b2daafae608d-1024x1024.jpg',
      artist: 'Aso, Middle School, Aviino',
      audio: 'https://mp3.chillhop.com/serve.php/?mp3=10074',
      color: ['#205950', '#2ab3bf'],
      id: uuidv4(),
      active: false,
    },
    {
      name: 'Under the City Stars',
      cover:
        'https://chillhop.com/wp-content/uploads/2020/09/0255e8b8c74c90d4a27c594b3452b2daafae608d-1024x1024.jpg',
      artist: 'Aso, Middle School, Aviino',
      audio: 'https://mp3.chillhop.com/serve.php/?mp3=10074',
      color: ['#205950', '#2ab3bf'],
      id: uuidv4(),
      active: false,
    },
    {
      name: 'Under the City Stars',
      cover:
        'https://chillhop.com/wp-content/uploads/2020/09/0255e8b8c74c90d4a27c594b3452b2daafae608d-1024x1024.jpg',
      artist: 'Aso, Middle School, Aviino',
      audio: 'https://mp3.chillhop.com/serve.php/?mp3=10074',
      color: ['#205950', '#2ab3bf'],
      id: uuidv4(),
      active: false,
    },
  ];
}
export default chillHop;