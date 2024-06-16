import PromptForm from "../components/PromptForm"
import ButtonAppBar from "../components/ButtonAppBar"
import { Grid, Hidden, Typography } from '@mui/material';
import PromptFormMobile from "../components/PromptFormMobile";

export default function Home() 
{
    return (
        <>
         <Grid container>
      {/* Mobile Layout */}
      <Hidden mdUp>
        <Grid item xs={12}>
          <PromptFormMobile></PromptFormMobile>
          {/* Mobile-specific content */}
        </Grid>
      </Hidden>
      
      {/* Desktop Layout */}
      <Hidden mdDown>
        <Grid item xs={12}>
        <PromptForm></PromptForm>
          {/* Desktop-specific content */}
        </Grid>
      </Hidden>
    </Grid>
        </>
    )
}
