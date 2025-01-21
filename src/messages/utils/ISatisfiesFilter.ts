import { IFilter } from "../../clientReqs/filters/Filter"

export interface ISatisfiesFilter {
    satisfiesFilters: ( filters: IFilter[] ) => boolean;
    satisfiesFilter: ( filter: IFilter ) => boolean;
}