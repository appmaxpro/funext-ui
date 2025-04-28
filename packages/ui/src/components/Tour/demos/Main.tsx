import { useTour } from '..'
import './styles.css'

export default function Main () {
  const { setIsOpen } = useTour()

  return (
    <div className="demo">
      <header>
        <button onClick={() => setIsOpen(true)}>Open Tour</button>
      </header>
      <p>
        <span className="first-step">Lorem ipsum</span> dolor sit amet, consectetur adipiscing elit. Praesent at
        finibus nulla, quis varius justo. <span className="second-step">Vestibulum lorem</span> lorem.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed hendrerit enim vel libero sagittis efficitur. Maecenas iaculis metus et magna mollis, sit amet dictum arcu elementum. Vestibulum non turpis at enim aliquet lobortis. Donec vel gravida tellus. Praesent nec tristique velit, at ullamcorper nibh. Suspendisse potenti. Proin ac dolor justo. <span className="third-step">Praesent nisi mauris</span>, eleifend sed iaculis a, tincidunt et tellus. Etiam vitae velit risus.  
      </p>
    </div>
  )
}