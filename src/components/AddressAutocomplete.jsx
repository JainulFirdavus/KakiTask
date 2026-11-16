import { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { searchAddresses } from '../utils/addressLookup.js'

export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const query = value.trim()
    if (query.length < 3) {
      setOptions([])
      setSearchError('')
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setSearchError('')
      try {
        setOptions(await searchAddresses(query, controller.signal))
      } catch (error) {
        if (error.name !== 'AbortError') setSearchError('Address suggestions are unavailable. You can still type the address and pin it on the map.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  return (
    <Autocomplete
      freeSolo
      options={options}
      filterOptions={(items) => items}
      value={null}
      inputValue={value}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
      onInputChange={(_, input, reason) => {
        if (reason === 'input' || reason === 'clear') onChange(input)
      }}
      onChange={(_, option) => {
        if (option && typeof option === 'object') onSelect(option)
      }}
      loading={loading}
      noOptionsText={searchError || 'No matching addresses'}
      renderOption={(props, option) => <li {...props} key={option.id}>{option.label}</li>}
      renderInput={(params) => (
        <TextField
          required
          id={params.id}
          disabled={params.disabled}
          fullWidth={params.fullWidth}
          label="Service address"
          placeholder="Start typing a street, area, or postal code"
          size={params.size}
          helperText={searchError || 'Choose a suggestion or pin the address on the map.'}
          slotProps={{
            inputLabel: params.slotProps.inputLabel,
            htmlInput: { ...params.slotProps.htmlInput, autoComplete: 'street-address', 'aria-label': 'Service address' },
            input: {
              ...params.slotProps.input,
              endAdornment: <>{loading ? <CircularProgress color="inherit" size={17} /> : null}{params.slotProps.input.endAdornment}</>,
            },
          }}
        />
      )}
    />
  )
}
