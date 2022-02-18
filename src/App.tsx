import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { DateTime } from "luxon";
import { useFormik } from 'formik';
import InputMask from "react-input-mask";

import { api } from './services/api';
import launchFormValidation from './validations/launch-form';
import { Backdrop, CircularProgress, Dialog, DialogActions, DialogTitle, FormHelperText, InputAdornment } from '@mui/material';
import axios from 'axios';

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

type FormProps = {
  accept_terms?: boolean;
  fullname: string;
  health_problems: string;
  identification: string;
  mission_id: number;
  weight: number;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFormSubmit(values: FormProps) {
    setIsLoading(true);
    delete values.accept_terms;
  
    const response = await axios.post('https://alume-teste.free.beeceptor.com/buy-ticket', values);
  
    if (response.status === 201) {
      setIsLoading(false);
      setIsDialogOpen(true);
    }
  }

  useEffect(() => {
    async function getUpcomingLaunchs() {
      setIsLoading(true);
      const response = await api.get('/launch/upcoming');
      const launchs = response.data.results;
      
      const nextSixMonthsLaunchs = getNextSixMonthsLaunchs(launchs);

      // format to use in autocomplete form field
      const formatedLaunches = nextSixMonthsLaunchs.map(launch => formatLaunch(launch));

      setLaunchs(formatedLaunches);
      setIsLoading(false);
    }

    getUpcomingLaunchs();
  }, []);

  const formik = useFormik({
    initialValues: {
      mission_id: 0,
      fullname: '',
      identification: '',
      weight: 0,
      health_problems: '',
      accept_terms: false
    },
    validationSchema: launchFormValidation,
    onSubmit: (values) => {handleFormSubmit(values)},
  });

  return (
    <div className='wrapper'>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>
          <Grid item xs={4} sm={6} md={12}>
            <Autocomplete
              options={launchs}
              onChange={(event, value) => {
                formik.setFieldValue("mission_id", value?.id);
              }}
              renderInput={(params) => (
                <TextField {...params} 
                  label="Selecionar vôo" 
                  name='mission_id'
                  value={formik.values.mission_id}
                  onChange={formik.handleChange}
                  error={formik.touched.mission_id && Boolean(formik.errors.mission_id)}
                  helperText={formik.touched.mission_id && formik.errors.mission_id}
                />
              )}
            />
          </Grid>
          <Grid item xs={4} sm={6} md={12}>
            <TextField 
              fullWidth 
              name='fullname' 
              label='Nome completo'
              value={formik.values.fullname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullname && Boolean(formik.errors.fullname)}
              helperText={formik.touched.fullname && formik.errors.fullname}
            />
          </Grid>

          <Grid item xs={4} sm={6} md={12}>
            <InputMask
              mask="999.999.999-99"
              maskPlaceholder={null}
              value={formik.values.identification}
              disabled={false}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <TextField
                fullWidth 
                name='identification' 
                label='CPF'
                error={formik.touched.identification && Boolean(formik.errors.identification)}
                helperText={formik.touched.identification && formik.errors.identification}
              />
            </InputMask>
            
          </Grid>

          <Grid item xs={4} sm={6} md={12}>
            <TextField 
              fullWidth 
              type='number' 
              name='weight' 
              label='Peso' 
              InputProps={{
                endAdornment: <InputAdornment position="end">gramas</InputAdornment>,
              }}
              value={formik.values.weight}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.weight && Boolean(formik.errors.weight)}
              helperText={formik.touched.weight && formik.errors.weight}
            />
          </Grid>

          <Grid item xs={4} sm={6} md={12}>
            <TextField 
              fullWidth 
              multiline 
              type='number' 
              name='health_problems' 
              label='Problemas de saúde' 
              value={formik.values.health_problems}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.health_problems && Boolean(formik.errors.health_problems)}
              helperText={formik.touched.health_problems && formik.errors.health_problems}
            />
          </Grid>

          <Grid item xs={4} sm={6} md={12}>
            <FormControlLabel 
              control={
                <Checkbox 
                  name='accept_terms' 
                  // checked={formik.values.accept_terms} 
                  onChange={formik.handleChange}  
                />
              } 
              label="Garanto que os dados indicados aqui são verdadeiros e que a inclusão ou omissão de dados podem causar o cancelamento da passagem."
            />
            <FormHelperText error={Boolean(formik.errors.accept_terms)}>
              {Boolean(formik.errors.accept_terms) ? formik.errors.accept_terms : ''}
            </FormHelperText>
          </Grid>

          <Grid item xs={4} sm={6} md={12}>
            <Button variant="contained" type='submit'>Finalizar compra</Button>
          </Grid>
        </Grid>
      </form>
      
      <Dialog
        open={isDialogOpen}
      >
        <DialogTitle>
          Compra efetuada com sucesso
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;
