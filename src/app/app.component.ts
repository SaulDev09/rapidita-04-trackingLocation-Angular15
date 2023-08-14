import { Component, OnInit } from '@angular/core';

import { Collection, Feature, Overlay, Map, View } from 'ol';
import { toLonLat, transform, fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';

import { TaxiDriver } from 'src/app/interfaces/taxiDriver.model';
import { TrackService } from './services/track.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public map!: Map;
  public tileLayer: any;
  public markerSource = new VectorSource();

  public markerStyle = new Style({
    image: new Icon({
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      color: '#ffcd46',
      src: 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/48/map-marker-icon.png',
    }),
  });

  private view = new View({
    center: fromLonLat([-77.11718009815769, -12.061078697609702]),
    zoom: 13,
  });

  public taxiDrivers: TaxiDriver[] = [];
  public taxiDriverFollowed: TaxiDriver | null = null;

  constructor(
    private trackService: TrackService
  ) {
    this.getTaxiDrivers();
  }

  getTaxiDrivers() {
    this.trackService.getDrivers().subscribe((data: TaxiDriver[]) => {
      this.taxiDrivers = data;
      this.taxiDrivers.forEach(item => {
        this.syncMarker(item.lon, item.lat, item.id);
      });
    })
  }

  ngOnInit(): void {
    this.tileLayer = new TileLayer({
      source: new OSM(),
    });

    this.map = new Map({
      target: 'ol-map',
      view: this.view,
      layers: [
        this.tileLayer, new VectorLayer({
          source: this.markerSource,
          style: this.markerStyle,
        }),
      ],
    });
  }

  private getPointFromLongLat(lon: number, lat: number) {
    return transform([lon, lat], 'EPSG:4326', 'EPSG:3857')
  }

  private syncMarker(lon: number, lat: number, id: string) {
    // console.log('id:', id, 'lon:', lon, 'lat:', lat);

    var featureToUpdate = this.markerSource.getFeatureById(id);
    if (featureToUpdate) {
      featureToUpdate.setGeometry(new Point(this.getPointFromLongLat(lon, lat)));
    } else {
      var iconFeature = new Feature({
        geometry: new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
      });
      iconFeature.setId(id);
      this.markerSource.addFeature(iconFeature);
    }

    if (this.taxiDriverFollowed) {
      this.taxiDrivers.forEach(item => {
        if (item.id === this.taxiDriverFollowed?.id) {
          this.taxiDriverFollowed = item;

          this.map.setView(
            new View({
              center: fromLonLat([this.taxiDriverFollowed.lon, this.taxiDriverFollowed.lat]),
              zoom: 16,
            })
          )
        }
      });
    }
  }

  startFollow(taxiDriver: TaxiDriver) {
    this.taxiDriverFollowed = taxiDriver;

    this.map.setView(
      new View({
        center: fromLonLat([this.taxiDriverFollowed.lon, this.taxiDriverFollowed.lat]),
        zoom: 18,
      })
    );
  }

  stopFollow() {
    this.taxiDriverFollowed = null;
  }
}