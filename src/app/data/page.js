
import { Data as AmigoData } from '../AmigoNoshery/data';
import { Data as KnlData } from '../knlrest/data';
import { Data as SnowfieldData } from '../snowfield/data';
import { Data as MauryaData } from '../maurya/data';
import { Data as BroData } from '../bro/data';
import { Data as SaiData } from '../sai/data';
import { Data as PvData } from '../pv/data';
import { Data as RgvData } from '../rgv/data';

export const Data = [
    ...AmigoData,
    ...KnlData,
    ...SnowfieldData,
    ...MauryaData,
    ...BroData,
    ...SaiData,
    ...PvData,
    ...RgvData
];