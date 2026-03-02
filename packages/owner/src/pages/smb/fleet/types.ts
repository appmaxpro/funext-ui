
type Vehicle = {
    id: number
    name: string
    created_date: string
    active: boolean
    license_plate: string
    brand_model: string
    model_year: string
    odometer_count: number
    color: string
    statistic: object
    state: string
    driver: object
    device_id: number
    purchase_amount: string
    last_trip_date: string
    current_trip: object
}

type VehicleAssignation = {
    id: number
    driver: object
    date_start: string
    date_end: string
}

type Driver = {
    id: number
    name: string
    citizen: string
    ref: string
    image: string
}

type FleetType = {
    id: number
    name: string
}

type Trip = {
    id: number
    date: string
    type: string
    state: string
    location: string
    ordered_count: string
    shipment_count: string
    distance: number
    duration: number
    act_duration: number
    delay_start: number
    delay_duration: number
    expense: number
    atd: string
    eta: string
    ata: string
}

type VehicleStatistic = {
    id: number
    name: string
    trip_count: number
    shipment_count: number
    maintenance_count: number
    assignation_count: number
    depreciation_count: number

    operation_revenue: number
    operation_expense: number

    account_income: number
    account_expense: number

    operation_percentage: number
    total_distance: number

    start_date: string
    end_date: string
}

type Transaction = {
    name: string
    amount: number
}

type Depreciation = {
    id: number
    value: number
    depreciation: number
    date: string
}