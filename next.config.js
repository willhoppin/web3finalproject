/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'm.media-amazon.com',
        'i.ebayimg.com',
        'cdn.shopify.com',
        'images.unsplash.com',
        's3.amazonaws.com',
        'cdn.sanity.io',
        'files.wordpress.com',
        'lh3.googleusercontent.com',
        'media.giphy.com',
        'i.imgur.com',
        'pbs.twimg.com',
        'cdn.pixabay.com',
        'upload.wikimedia.org',
        'cdn.vox-cdn.com',
        'static1.squarespace.com',
        'static.flickr.com',
        'media-exp1.licdn.com',
        'assets.website-files.com',
        'images.squarespace-cdn.com',
        'i.etsystatic.com',
        // ... add more domains as needed
      ],
    },
    // ... include other configurations if needed
  }
  
  module.exports = nextConfig;
  