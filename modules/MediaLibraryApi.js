import CacheDecorator from '../helpers/cacheDecorator';
import iTunes from 'react-native-itunes';

class MediaLibraryApi {
  
  constructor(){
    this.api = iTunes;
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.transformPlaylistPayload = this.transformPlaylistPayload.bind(this);
    this.transformSelectionPayload = this.transformSelectionPayload.bind(this);
    this.initializeCacheDecorators();
  }
  initializeCacheDecorators(){
    // this.getPopularByGenre = CacheDecorator.withCache(
    //   this.getPopularByGenre.bind(this),
    //   'getPopularByGenre',
    //   3600*1e3
    // );
  }
  getAllTracks(){
    return this.api.getTracks({fields:this.TRACK_FIELDS}).then((tracks) => {
      return tracks.filter(this.isDeviceTrack).map(this.transformTrackPayload);
    });
  }
  isDeviceTrack(t){
    return t.isCloudItem === false;
  }
  transformSelectionPayload(selection){
    return {
      urn : selection.urn,
      label : selection.title,
      description : selection.description,
      playlists: (selection.playlists || []).map(this.transformPlaylistPayload)
    };
  }
  transformPlaylistPayload(t){
    let tracks = undefined;
    if(t.tracks){
      tracks = t.tracks.map(this.transformTrackPayload);
    }
    return {
      type: 'playlist',
      id: t.id,
      label : t.title,
      username: t.user.username,
      artwork : t.artwork_url,
      duration : t.duration,
      trackCount: t.track_count,
      tracks
    };
  }
  transformTrackPayload(t,i){
    return {
      id: 'local'+i,
      type: 'track',
      label : t.title,
      username: t.albumArtist,
      streamUrl : t.assetUrl,
      //artwork : t.artwork, works but needs performance optimization 
      //+ base64 payload should be cached outside of the redux store
      scUploaderLink : null,
      duration: t.duration * 1e3,
      // playbackCount: t.playCount,
      provider : 'library'
    };
  }
  resolvePlayableTrackItem(trackObj){
    return trackObj;
  }
}
MediaLibraryApi.TRACK_FIELDS = MediaLibraryApi.prototype.TRACK_FIELDS = [
  'title',
  'albumArtist',
  'assetUrl',
  'isCloudItem',
//  'artwork', disable artwork for now for performance reasons
  'duration',
  'playCount'
];

export default MediaLibraryApi;