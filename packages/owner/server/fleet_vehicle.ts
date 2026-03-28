
type FleetVehicle = {
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


function search() {
  return {
    offset: 0,
    limit: 2,
    total: 2,
    data: [
      {
        id: 1,
        name: 'vehicle 1',
        created_date: '2026-01-01T00:00',
        active: true,
        license_plate: 'ADD 1234',
        brand_model: 'TEST/Test',
        model_year: '2000',
        odometer_count: 111,
        color: 'red',
        statistic: {},
        state: 'active',
        driver: [1, 'Nabil Mohammed'],
        device_id: 1,
        purchase_amount: '5000',
        last_trip_date: '2026-01-01T00:00',
        current_trip: 212,
      },
      {
        id: 2,
        name: 'vehicle 2',
        created_date: '2026-01-01T00:00',
        active: true,
        license_plate: 'ADD 1235',
        brand_model: 'TEST/Test',
        model_year: '2000',
        odometer_count: 111,
        color: 'red',
        statistic: {},
        state: 'active',
        driver: [1, 'Nabil Mohammed'],
        device_id: 1,
        purchase_amount: '5000',
        last_trip_date: '2026-01-01T00:00',
        current_trip: 212,
      }
    ]
  }
}


function read(id:any) {
  id = Number(id)
  return {
    data: search().data.find(rec => rec.id === id)
  }
}


export default {
  search,
  read
}