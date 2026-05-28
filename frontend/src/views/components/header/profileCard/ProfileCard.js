import { useState, useContext } from 'react';
import Collapse from 'material-ui-next/Collapse'
import styles from './ProfileCard.module.css'
import useProfileStyles from './ProfileCard.override';
import useStyles from '../../../styleOverrides/buttons';
import { auth, firebase } from '../../../../firebase';
import { AppContext } from '../../../../AppContextProvider';
import { Button, IconButton, TextField } from '@material-ui/core';
import ProfileIcon from './profileIcon/ProfileIcon';
import { useHistory } from 'react-router-dom';

export default function ProfileCard() {
    const history = useHistory();
    const [open, setOpen] = useState(false);
    const [restrict, setRestrict] = useState(false);
    const [showProfileInfo] = useState(true);
    const { firebaseUserIdToken } = useContext(AppContext);
    const [loginName, setLoginName] = useState('');

    const classes = useStyles();
    const profileClasses = useProfileStyles();

    history.listen((location) => {
        if (location.pathname === '/lobby'){ // if location is sensitive and we dont want them to log out
            setRestrict(true);
        } else {
            setRestrict(false);
        }
    })

    function handleToggle() {
        setOpen((prevOpen) => !prevOpen);
    };

    function toProfilePage() {
        history.push({
            pathname: '/profile',
            state: {},
        });
    }
    
    async function googleLogout() {
        await auth.signOut().then(() => {
            setOpen(false);
            console.log('Logged out successfully.');
        }).catch((error) => {
            console.log('Error logging out.', error);
        });
    }

    return(
        <div>
            <Collapse in={ open } orientation='horizontal' collapsedSize={87}>      
                <div className={styles.statusPlaque}> 
                    <IconButton className={styles.iconButton} onClick={handleToggle}>
                        <ProfileIcon auth={auth} firebaseUserIdToken={firebaseUserIdToken}/>
                    </IconButton>
                    { showProfileInfo ?
                        <div className={styles.statusBar}>
                            { firebaseUserIdToken ? (
                                <>
                                    <h2 className={styles.profileName}>{auth?.currentUser?.displayName}</h2>
                                    { restrict ? null :
                                    <div className={styles.profileActionsContainer}>
                                        <Button className={`${profileClasses.profileActionsBtn} ${classes.button}`} onClick={toProfilePage}>
                                            Profile
                                        </Button>
                                        <Button className={`${profileClasses.profileActionsBtn} ${classes.button} ${classes.redButton}`} onClick={googleLogout}>
                                            Log out
                                        </Button>
                                    </div>
                                    }
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                                    <TextField
                                        size="small"
                                        label="Name"
                                        variant="outlined"
                                        value={loginName}
                                        onChange={(e) => setLoginName(e.target.value)}
                                        style={{ marginRight: '8px', maxWidth: '120px' }}
                                        inputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#ccc' } }}
                                    />
                                    <Button 
                                        className={classes.button}
                                        style={{ height: '36px' }}
                                        onClick={() => {
                                            if (loginName.trim()) {
                                                auth.mockLogin(loginName.trim());
                                                setLoginName('');
                                            }
                                        }}
                                    >
                                        Log In
                                    </Button>
                                </div>
                            )}
                        </div>
                    : null
                    }
                </div>   
            </Collapse>
        </div>
    )
}
