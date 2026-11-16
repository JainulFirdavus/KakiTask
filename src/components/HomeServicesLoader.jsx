import { CircularProgress } from '@mui/material'
import HomeRepairServiceRoundedIcon from '@mui/icons-material/HomeRepairServiceRounded'
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded'
import PlumbingRoundedIcon from '@mui/icons-material/PlumbingRounded'
import ElectricalServicesRoundedIcon from '@mui/icons-material/ElectricalServicesRounded'
import { motion } from 'framer-motion'

const serviceIcons = [
  CleaningServicesRoundedIcon,
  PlumbingRoundedIcon,
  ElectricalServicesRoundedIcon,
]

export default function HomeServicesLoader() {
  return (
    <motion.div
      className="home-loader"
      role="status"
      aria-label="Loading home services"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loader-mark">
        <CircularProgress className="loader-progress" size={74} thickness={2} />
        <span className="loader-home-icon"><HomeRepairServiceRoundedIcon /></span>
        {serviceIcons.map((Icon, index) => (
          <motion.span
            className={`loader-service-icon loader-service-icon-${index}`}
            key={index}
            animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 1.5 + index * 0.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.12 }}
          >
            <Icon />
          </motion.span>
        ))}
      </div>
      <span className="loader-title">Home needs, handled.</span>
      <span className="loader-caption">Finding the right service for you</span>
    </motion.div>
  )
}
