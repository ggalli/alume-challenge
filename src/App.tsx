import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { DateTime } from "luxon";

import { api } from './services/api';

type launchProps = {
  window_start: string;
  mission: {
    name: string;
    id: number;
  }
  pad: {
    location: {
      name: string;
    }
  }
}

type NewLaunchProps = {
  label: string;
  id: number;
}

function getNextSixMonthsLaunchs(launchs: launchProps[]) {
  const currentDate = DateTime.now();

  const nextSixMonthsDate = currentDate.plus({months: 6});

  const nextSixMonthsLaunchs = launchs.filter(launch => {
    let windowStart = DateTime.fromISO(launch.window_start);
    
    // return only next six months launchs and launchs with mission
    return windowStart <= nextSixMonthsDate && launch.mission;
  });

  return nextSixMonthsLaunchs;
}

function formatLaunch(launch: launchProps) {
  const { mission, window_start, pad } = launch;

  const date = DateTime.fromISO(window_start, { setZone: true }).toLocaleString();

  const label = `${mission.name}, em ${date} de ${pad.location.name}`;

  return {
    label,
    id: mission.id
  }
}

function App() {
  const [launchs, setLaunchs] = useState<NewLaunchProps[]>([]);

  useEffect(() => {
    async function getUpcomingLaunchs() {
      const response = await api.get('/launch/upcoming');
      const launchs = response.data.results;
      
      const nextSixMonthsLaunchs = getNextSixMonthsLaunchs(launchs);

      // format to use in autocomplete form field
      const formatedLaunches = nextSixMonthsLaunchs.map(launch => formatLaunch(launch));

      setLaunchs(formatedLaunches);
    }

    getUpcomingLaunchs();
  }, [])

  return (
    <div className='wrapper'>
      <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>

        <Grid item xs={4} sm={6} md={12}>
          <Autocomplete 
            options={launchs}
            renderInput={(params) => <TextField {...params} label="Movie" />}
          />
        </Grid>

        <Grid item xs={4} sm={6} md={12}>
          <TextField label='Nome completo' name='fullname' fullWidth />
        </Grid>

        <Grid item xs={4} sm={6} md={12}>
          <TextField type='number' label='CPF' name='identification' fullWidth />
        </Grid>

        <Grid item xs={4} sm={6} md={12}>
          <TextField type='number' label='Peso' name='weight' fullWidth />
        </Grid>

        <Grid item xs={4} sm={6} md={12}>
          <TextField type='number' label='Problemas de saúde' name='health_problems' multiline fullWidth />
        </Grid>

        <Grid item xs={4} sm={6} md={12}>
          <FormControlLabel control={<Checkbox />} label="Garanto que os dados indicados aqui são verdadeiros e que a inclusão ou omissão de dados podem causar o cancelamento da passagem." />
        </Grid>

        <Grid item xs={4} sm={6} md={12}>
          <Button variant="contained">Finalizar compra</Button>
        </Grid>

      </Grid>
    </div>
  );
}

export default App;
