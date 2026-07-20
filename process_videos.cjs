const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

const files = ['LOGO1.mp4', 'LOGO2.mp4', 'LOGO3.mp4'];
const outFiles = ['public/LOGO1.webm', 'public/LOGO2.webm', 'public/LOGO3.webm'];

files.forEach((file, index) => {
  ffmpeg(file)
    .outputOptions([
      '-vf', 'colorkey=0xF3541C:0.1:0.1',
      '-c:v', 'libvpx-vp9',
      '-b:v', '2M',
      '-auto-alt-ref', '0',
      '-pix_fmt', 'yuva420p'
    ])
    .on('end', () => console.log('Finished ' + file))
    .on('error', (err) => console.error('Error on ' + file, err))
    .save(outFiles[index]);
});
