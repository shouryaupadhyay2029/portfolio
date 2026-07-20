const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

ffmpeg('WEBNAME.mp4')
  .outputOptions([
    '-vf', 'colorkey=0x000000:0.05:0.1',
    '-c:v', 'libvpx-vp9',
    '-b:v', '2M',
    '-auto-alt-ref', '0',
    '-pix_fmt', 'yuva420p'
  ])
  .on('end', () => console.log('Finished processing WEBNAME'))
  .on('error', (err) => console.error('Error:', err))
  .save('public/WEBNAME.webm');
