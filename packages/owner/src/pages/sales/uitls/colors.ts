

export function getProgressClass(percent:number){

    let cclass:string = 'bg-red-50 text-red-700 ring-red-200'
    
    if (percent < 50){}
    else if (percent < 60)
        cclass = 'bg-orange-50 text-orange-700 ring-orange-200'
    else if (percent < 70)
        cclass = 'bg-pink-50 text-pink-700 ring-pink-200'
    else if (percent < 89)
        cclass = 'bg-blue-50 text-blue-700 ring-blue-200'
    else if (percent <= 90)
        cclass = 'bg-indigo-50 text-indigo-700 ring-indigo-200'
    else if (percent <= 101)
        cclass = 'bg-green-50 text-green-700 ring-green-200'
    else
        cclass = 'bg-green-100 text-green-800 ring-green-300'

  
    return cclass
}