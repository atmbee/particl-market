// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MarketService } from '../../services/model/MarketService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketType } from '../../enums/MarketType';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';

export class MarketAddCommand extends BaseCommand implements RpcCommandInterface<Market> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.MARKET_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: name
     *  [2]: type: MarketType
     *  [3]: receiveKey
     *  [4]: receiveAddress
     *  [5]: publishKey
     *  [6]: publishAddress
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Market> {
        const profile: resources.Profile = data.params[0];

        return this.marketService.create({
            profile_id: profile.id,
            name : data.params[1],
            type : data.params[2],
            receiveKey : data.params[3],
            receiveAddress : data.params[4],
            publishKey : data.params[5],
            publishAddress : data.params[6]
        } as MarketCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: name
     *  [2]: type: MarketType
     *  [3]: receiveKey
     *  [4]: receiveAddress
     *  [5]: publishKey
     *  [6]: publishAddress
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // TODO: generate the address from the pk

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('name');
        } else if (data.params.length < 3) {
            throw new MissingParamException('type');
        } else if (data.params.length < 4) {
            throw new MissingParamException('receiveKey');
        } else if (data.params.length < 5) {
            throw new MissingParamException('receiveAddress');
        } else if (data.params.length === 6) {
            throw new MissingParamException('publishAddress');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('name', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('type', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('receiveKey', 'string');
        } else if (typeof data.params[4] !== 'string') {
            throw new InvalidParamException('receiveAddress', 'string');
        } else if (data.params[5] && typeof data.params[5] !== 'string') {
            throw new InvalidParamException('publishKey', 'string');
        } else if (data.params[6] && typeof data.params[6] !== 'string') {
            throw new InvalidParamException('publishAddress', 'string');
        }

        if (!EnumHelper.containsName(MarketType, data.params[2])) {
            throw new InvalidParamException('model', 'MarketType');
        }

        data.params[5] = data.params[5] ? data.params[5] : data.params[3];
        data.params[6] = data.params[6] ? data.params[6] : data.params[4];
        return data;
    }

    public usage(): string {
        return this.getName() + ' <name> <type> <receiveKey> <receiveAddress>'; //  [publishKey] [publishAddress] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>                   - String - The unique name of the market being created. \n'
            + '    <type>                   - MarketType - MARKETPLACE \n'
            + '    <receiveKey>             - String - The receive private key of the market. \n'
            + '    <receiveAddress>         - String - The receive address matching the receive private key';
            // + '    <publishKey>             - String - The publish private key of the market. \n'
            // + '    <publishAddress>         - String - The publish address matching the receive private key';
    }

    public description(): string {
        return 'Create a new market.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' market add \'mymarket\' \'MARKETPLACE\' \'2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek\' ' +
            '\'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA\' ';
    }
}
