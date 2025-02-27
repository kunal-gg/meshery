import { Button, Chip, IconButton, TableCell, TableSortLabel, Tooltip, Typography, withStyles } from "@material-ui/core";
import { withSnackbar } from "notistack";
import React, { useEffect, useState } from "react"
import DataTable from "mui-datatables";
import Modal from "./Modal"
import { CON_OPS } from "../utils/Enum";
import dataFetch from "../lib/data-fetch";
import AddIconCircleBorder from "../assets/icons/AddIconCircleBorder";
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import Moment from "react-moment";
import LoadingScreen from "./LoadingComponents/LoadingComponent";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateProgress } from "../lib/store";


const styles = (theme) => ({
  muiRow : {
    marginTop : theme.spacing(1.5)
  },
  iconPatt : {
    width : "24px",
    height : "24px",
    filter : theme.palette.secondary.brightness
  },
});


const schema_array = ["prometheus", "grafana", "kubernetes"]

const MesheryCredentialComponent = ({
  updateProgress, enqueueSnackbar, closeSnackbar, classes
}) => {

  const [credentials, setCredentials] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [credModal, setCredModal] = useState({
    open : false,
    data : null,
    actionType : null,
    id : null
  });
  const [credentialType, setCredentialType] = useState(schema_array[0]);
  const [credentialName, setCredentialName] = useState(null);

  useEffect(() => {
    fetchCredential();
  }, []);

  const handleOpen = (ev) => (data, type, id) => {
    ev.stopPropagation();
    (data && setCredentialType(data?.type))
    setCredModal({
      open : true,
      data : data?.secret || null,
      actionType : type,
      id : id
    })
  }

  const schemaChangeHandler = (type) => {
    setCredentialType(type);
    setCredModal((prev) => ({
      ...prev,
      open : true,
      data : null
    }))
  }

  const _onChange=(formData) => {
    setCredentialName(formData?.credentialName);
    setFormData(formData)
  }

  const handleClose = (ev) => {
    ev.stopPropagation();
    setCredModal({
      open : false,
      data : null,
      actionType : null,
      id : null
    })

  }

  const handleError = (error_msg) => {
    updateProgress({ showProgress : false });

    enqueueSnackbar(`${error_msg}`, {
      variant : "error",
      action : function Action(key) {
        return (
          <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
            <CloseIcon />
          </IconButton>
        );
      },
      autoHideDuration : 5000,
    });
  };

  const fetchCredential = async () => {
    updateProgress({ showProgress : true });
    dataFetch(
      "/api/integrations/credentials",
      {
        credentials : "include",
        method : "GET",
      },
      (resp) => {
        updateProgress({ showProgress : false })
        setCredentials(resp?.credentials)
        setLoading(false)
      },
      () => {
        handleError("Unable to fetch credentials")
      },
    );
  }

  const getCredentialsIcon = (type) => {
    switch (type) {
      case "prometheus":
        return <img src="/static/img/prometheus_logo_orange_circle.svg" className={classes.iconPatt} />
      case "grafana":
        return <img src="/static/img/grafana_icon.svg" className={classes.iconPatt} />
      case "kubernetes":
        return <img src="/static/img/kubernetes.svg" className={classes.iconPatt} />
      default:
        return
    }
  }

  const columns = [
    {
      name : "name",
      label : "Name",
      options : {
        filter : true,
        sort : false,
        searchable : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
      }
    },
    {
      name : "type",
      label : "Type",
      options : {
        filter : true,
        sort : false,
        searchable : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
        customBodyRender : function CustomBody(_, tableMeta) {
          return (
            <Tooltip title={tableMeta.rowData[1]}>
              <Chip
                label={tableMeta.rowData[1]}
                variant="outlined"
                icon={getCredentialsIcon(tableMeta.rowData[1])}
              />
            </Tooltip>
          )
        }
      }
    },
    {
      name : "created_at",
      label : "Creation Date",
      options : {
        filter : true,
        sort : false,
        searchable : true,
        sortDescFirst : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
        customBodyRender : function CustomBody(value) {
          return <Moment format="LLLL">{value}</Moment>;
        },
      }
    },
    {
      name : "updated_at",
      label : "Updation Date",
      options : {
        filter : true,
        sort : false,
        searchable : true,
        sortDescFirst : true,
        customHeadRender : function CustomHead({ index, ...column }, sortColumn) {
          return (
            <TableCell key={index} onClick={() => sortColumn(index)}>
              <TableSortLabel active={column.sortDirection != null} direction={column.sortDirection || "asc"}>
                <b>{column.label}</b>
              </TableSortLabel>
            </TableCell>
          );
        },
        customBodyRender : function CustomBody(value) {
          return <Moment format="LLLL">{value}</Moment>;
        },
      }
    },
    {
      name : "actions",
      label : "Actions",
      options : {
        filter : false,
        sort : false,
        searchable : false,
        customHeadRender : function CustomHead({ index, ...column }) {
          return (
            <TableCell key={index}>
              <b>{column.label}</b>
            </TableCell>
          );
        },
        customBodyRender : (_, tableMeta) => {
          const rowData = credentials[tableMeta.rowIndex];
          return (
            <div style={{ display : "flex", alignItems : "center", justifyContent : "space-around" }}>
              <Tooltip
                key={`edit_credential-${tableMeta.rowIndex}`}
                title="Edit Credential"
              >
                <IconButton
                  aria-label="edit"
                  onClick={(ev) => handleOpen(ev)(rowData,"update",rowData["id"])}
                >
                  <EditIcon/>
                </IconButton>
              </Tooltip>
              <Tooltip
                key={`delete_credential-${tableMeta.rowIndex}`}
                title="Delete Credential"
              >
                <IconButton
                  aria-label="delete"
                  onClick={() => handleSubmit({ type : "delete", id : rowData["id"] })}
                >

                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          );
        }
      }
    }
  ];
  const options = {
    filter : false,
    rowsPerPageOptions : [10, 20, 25],
    filterType : "textField",
    responsive : "standard",
    print : false,
    download : false,
    selectToolbarPlacement : "none",
    selectableRows : false,
    elevation : 0,
    draggableColumns : {
      enabled : true
    },
    customToolbar : () => (
      <>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          onClick={(ev) => handleOpen(ev)(null,"create", null)}
          style={{
            "padding" : "0.5rem",
            "borderRadius" : 5,
            "marginRight" : "2rem"
          }}
          data-cy="btnResetDatabase"
        >
          <AddIconCircleBorder  style={{ width : "1.25rem" }} />
          <Typography
            style={{
              "paddingLeft" : "0.25rem" ,
              "marginRight" : "0.25rem"
            }}
          >
          Create
          </Typography>
        </Button>
      </>
    )
  };

  // control the entire submit
  const handleSubmit= ({ id, type }) => {
    updateProgress({ showProgress : true });

    if (type === CON_OPS.DELETE){
      dataFetch(
        `/api/integrations/credentials?credential_id=${id}`,
        {
          credentials : "include",
          method : "DELETE"
        },
        () => {
          fetchCredential();
          updateProgress({ showProgress : false })
          enqueueSnackbar(`"${type}" deleted.`, {
            variant : "success",
            action : function Action(key) {
              return (
                <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
                  <CloseIcon />
                </IconButton>
              );
            },
            autoHideDuration : 2000,
          });
        },
        () => {
          handleError("Failed to delete credentials.")
        }
      )
    }
    if (type === CON_OPS.CREATE){
      const data = {
        name : credentialName,
        type : credentialType,
        secret : formData
      }
      dataFetch(
        `/api/integrations/credentials`,
        {
          credentials : "include",
          method : "POST",
          body : JSON.stringify(data)
        },
        () => {
          fetchCredential()
          updateProgress({ showProgress : false })
          enqueueSnackbar(`"${credentialType}" created.`, {
            variant : "success",
            action : function Action(key) {
              return (
                <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
                  <CloseIcon />
                </IconButton>
              );
            },
            autoHideDuration : 2000,
          });
        },
        () => {
          handleError("Failed to create credentials.")
        }
      )
    }

    if (type === CON_OPS.UPDATE){
      const data = {
        id : id,
        name : credentialName,
        type : credentialType,
        secret : formData
      }
      dataFetch(
        `/api/integrations/credentials`,
        {
          credentials : "include",
          method : "PUT",
          body : JSON.stringify(data)
        },
        () => {
          fetchCredential();
          updateProgress({ showProgress : false })
          enqueueSnackbar(`"${credentialType}" updated.`, {
            variant : "success",
            action : function Action(key) {
              return (
                <IconButton key="close" aria-label="Close" color="inherit" onClick={() => closeSnackbar(key)}>
                  <CloseIcon />
                </IconButton>
              );
            },
            autoHideDuration : 2000,
          });

        },
        () => {
          handleError("Failed to update credentials.")
        }
      )
    }

  }

  if (loading) {
    return <LoadingScreen animatedIcon="AnimatedMeshery" message="Loading Credentials"/>;
  }
  return (
    <div style={{ display : 'table', tableLayout : 'fixed', width : '100%' }}>
      <DataTable
        columns={columns}
        data={credentials}
        options={options}
        className={classes.muiRow}
      />
      <Modal open={credModal.open} formData={credModal.data} title="Credentials" handleClose={handleClose} onChange={_onChange} schema_array={schema_array} type={credentialType} schemaChangeHandler={schemaChangeHandler} handleSubmit={handleSubmit} payload={{ type : credModal.actionType, id : credModal.id }} submitBtnText="Save"/>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({ updateProgress : bindActionCreators(updateProgress, dispatch) });

export default withStyles(styles)(connect(null, mapDispatchToProps)(withSnackbar(MesheryCredentialComponent)));