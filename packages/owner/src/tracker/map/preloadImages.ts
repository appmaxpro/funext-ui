import { loadImage, prepareIcon } from './mapUtil';

import directionSvg from '../../assets/images/direction.svg';
import backgroundSvg from '../../assets/images/background.svg';
import animalSvg from '../../assets/images/icon/animal.svg';
import bicycleSvg from '../../assets/images/icon/bicycle.svg';
import boatSvg from '~/assets/images/icon/boat.svg';
import busSvg from '../../assets/images/icon/bus.svg';
import carSvg from '../../assets/images/icon/car.svg';
import camperSvg from '../../assets/images/icon/camper.svg';
import craneSvg from '../../assets/images/icon/crane.svg';
import defaultSvg from '../../assets/images/icon/default.svg';
import startSvg from '../../assets/images/icon/start.svg';
import finishSvg from '../../assets/images/icon/finish.svg';
import helicopterSvg from '../../assets/images/icon/helicopter.svg';
import motorcycleSvg from '../../assets/images/icon/motorcycle.svg';
import personSvg from '../../assets/images/icon/person.svg';
import planeSvg from '../../assets/images/icon/plane.svg';
import scooterSvg from '../../assets/images/icon/scooter.svg';
import shipSvg from '../../assets/images/icon/ship.svg';
import tractorSvg from '../../assets/images/icon/tractor.svg';
import trailerSvg from '../../assets/images/icon/trailer.svg';
import trainSvg from '../../assets/images/icon/train.svg';
import tramSvg from '../../assets/images/icon/tram.svg';
import truckSvg from '../../assets/images/icon/truck.svg';
import vanSvg from '../../assets/images/icon/van.svg';

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  camper: camperSvg,
  crane: craneSvg,
  default: defaultSvg,
  finish: finishSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  person: personSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  start: startSvg,
  tractor: tractorSvg,
  trailer: trailerSvg,
  train: trainSvg,
  tram: tramSvg,
  truck: truckSvg,
  van: vanSvg,
};

type MapIcons = typeof mapIcons;

export const mapIconKey = (category?:string) => {
  switch (category) {
    case 'offroad':
    case 'pickup':
      return 'trailer';
    case 'trolleybus':
      return 'bus';
    default:
      return category && mapIcons.hasOwnProperty(category) ? category : 'truck';
  }
};

export const mapImages = <any>{};

const theme = {
  neutral: 'rgb(106 114 130)',
  error: 'rgb(251 44 54)',
  success: 'rgb(0 201 81)',
  blue: '#2b7fff',
  slate: '#62748e',
  info: 'rgb(0 166 244)'
} as any;
export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  await Promise.all(
    Object.keys(mapIcons).map(async (category) => {
      //@ts-ignore
      const results = [];
      ['info', 'success', 'error', 'neutral'].forEach((color) => {
        results.push(
          //@ts-ignore
          loadImage(mapIcons[category]).then((icon) => {
            mapImages[`${category}-${color}`] = prepareIcon(
              background,
              icon,
              theme[color],
            );
          }),
        );
      });
      //@ts-ignore
      await Promise.all(results);
    }),
  );
};